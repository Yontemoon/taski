import Redis from "ioredis"

const redis = new Redis("rediss://default:AYyBAAIjcDFmMDFlODU4NzUyNTU0ZWNiOWVlMDVkNTYyZjJjOWE4N3AxMA@valued-manatee-35969.upstash.io:6379");

export {redis}