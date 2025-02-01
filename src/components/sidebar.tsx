import { Calendar } from "./ui/calendar";
import { useNavigate, useParams } from "@tanstack/react-router";
import { formatDate } from "@/lib/utils";

const Sidebar = () => {
  const navigate = useNavigate();
  const params = useParams({ from: "/_authed/todo/$id" });

  return (
    <nav>
      <Calendar
        selected={(date) => {
          const formatedDate = formatDate(date);
          return formatedDate === params.id;
        }}
        onDayClick={(e) => {
          console.log(params);
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
