import { supabase } from "@/lib/supabase";

const getSchedule = async ({pageParam}: {pageParam: number}) => {

    const min = pageParam * 100
    const max = min + 99

    try {
        const { data, error} = await supabase
            .from("todos")
            .select("*")
            .order("date_set", { ascending: false })
            .limit(100)
            .range(min, max)
            
        if (error) {
            throw new Error(error.message)
        }

        return {
            data: data,
            nextPage: pageParam + 1
        }
    } catch (error) {
        console.error("Error in getSchedule", error)
        return null
    }
}

export { getSchedule }