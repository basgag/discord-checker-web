#!/usr/bin/env python

import asyncio
from datetime import datetime, timedelta

import aiohttp
from prisma import Prisma


class TokenCheker:
    def __init__(self) -> None:
        self.db = Prisma()

        self.counter_working: int = 0
        self.counter_not_working: int = 0

        self._requests_count: int = 0
        self._rate_limit: int = 60
        self._is_rate_limit: bool = False

    @property
    def discord_api(self) -> str:
        return "https://discord.com/api/v10"

    @staticmethod
    def headers(token: str) -> dict:
        return {"authorization": token}

    async def check_token(self, token: str) -> None:
        async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(limit=200)) as session:
            async with session.get(f"{self.discord_api}/users/@me", headers=self.headers(token)) as r:
                account = await self.db.discordaccount.find_first(where={"tokens": {"some": {"value": token}}},
                                                                  include={"tokens": True})

                if r.status == 200:
                    if account:
                        user = await r.json()

                        to_delete = ["pronouns", "linked_users", "avatar_decoration", "has_bounced_email",
                                     "purchased_flags", "premium_usage_flags", "avatar_decoration_data",
                                     "authenticator_types"]
                        for key in to_delete:
                            if key in user:
                                del user[key]

                        await self.db.discordaccount.update(where={"id": account.id}, data={**user})
                        await self.db.discordtoken.update(where={"value": token},
                                                          data={"lastCheckedAt": datetime.now()})

                    self.counter_working += 1
                    return

                if r.status == 401 or r.status == 403:
                    self.counter_not_working += 1

                    if account:
                        if len(account.tokens) > 1:
                            await self.db.discordtoken.delete(where={"value": token})
                        else:
                            await self.db.discordaccount.delete(where={"id": account.id})

    async def _run(self) -> None:
        await self.db.connect()

        tokens = await self.db.discordtoken.find_many(where={
            "lastCheckedAt": {"lte": datetime.now() - timedelta(hours=3)}
        })
        print("Total tokens to check: {}".format(len(tokens)))

        if len(tokens) == 0:
            print("No tokens to check.")
            exit(0)

        tasks: list = []
        for token in [token.value for token in tokens]:
            self._requests_count += 1

            if self._requests_count >= self._rate_limit:
                print("\nRate limit was active waiting 1 second...\n")
                self._requests_count = 0
                await asyncio.sleep(1)

            tasks.append(asyncio.create_task(self.check_token(token)))
            print("Total checked: {} | Working: {} | Not Working: {}".format(
                self.counter_working + self.counter_not_working, self.counter_working, self.counter_not_working),
                end="\r")

        await asyncio.wait(tasks)
        print(
            "Total checked: {} | Working: {} | Not Working: {}".format(self.counter_working + self.counter_not_working,
                                                                       self.counter_working, self.counter_not_working))


if __name__ == '__main__':
    token_cheker = TokenCheker()
    asyncio.run(token_cheker._run())
