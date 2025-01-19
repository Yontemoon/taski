import { z } from "zod";
import { formatDate } from "@/lib/utils";


/// 
// Search Params Types
///

const ZIndexSearch = z.object({
  date: z.string().default(formatDate(new Date())),
});

export {ZIndexSearch}
