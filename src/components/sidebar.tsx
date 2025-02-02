import { Calendar } from "./ui/calendar";
import { useNavigate, useParams } from "@tanstack/react-router";
import { formatDate } from "@/lib/utils";

const Sidebar = () => {
  const navigate = useNavigate();
  const params = useParams({ from: "/_authed/todo/$id" });
  console.log("passing sidebar");

  return (
    <nav>
      <Calendar
        selected={(date) => {
          const formatedDate = formatDate(date);
          return formatedDate === params.id;
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
