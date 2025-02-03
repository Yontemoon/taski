import { Calendar } from "./ui/calendar";
import {
  useNavigate,
  useParams,
  useRouteContext,
} from "@tanstack/react-router";
import { formatDate } from "@/lib/utils";
import { tagsQueryOptions, todosQueryOptions } from "@/lib/options";

const Sidebar = () => {
  const navigate = useNavigate();
  const { queryClient, auth } = useRouteContext({
    from: "/_authed/todo/$id",
  });
  const params = useParams({ from: "/_authed/todo/$id" });

  return (
    <nav>
      <Calendar
        selected={(date) => {
          const formatedDate = formatDate(date);
          return formatedDate === params.id;
        }}
        onDayMouseEnter={(e) => {
          const userId = auth.user?.id!;
          const date = formatDate(e);
          queryClient.prefetchQuery(todosQueryOptions(userId, date));
          queryClient.prefetchQuery(tagsQueryOptions(userId, date));
        }}
        onDayClick={(e) => {
          const date = formatDate(e);
          navigate({
            to: "/todo/$id",
            params: {
              id: date,
            },
          });
        }}
      />
    </nav>
  );
};

export default Sidebar;
