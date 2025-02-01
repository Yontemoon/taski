import { TTodos } from "@/types/tables.types";
import { useForm } from "@tanstack/react-form";
import InputSelector from "@/components/input-selector";
import { useTagSelectionReducer } from "./hooks";
import { Button } from "@/components/ui/button";
import { useTodoMutations } from "./hooks";

type PropTypes = {
  todo: TTodos;
  setIsNavigational: React.Dispatch<React.SetStateAction<boolean>>;
  ref: React.RefObject<HTMLDivElement>;
};

const DialogTodoEdit = ({ todo, setIsNavigational, ref }: PropTypes) => {
  const { dispatch, state } = useTagSelectionReducer();
  const { editMutation } = useTodoMutations(todo.user_id, todo.date_set);

  const form = useForm({
    defaultValues: {
      todoEdit: todo.todo,
    },
    onSubmit: async ({ value }) => {
      const data = {
        todo_id: todo.id,
        updated_todo: value.todoEdit,
        user_id: todo.user_id,
      };
      console.log(data);

      editMutation.mutate(data);
    },
  });

  return (
    <form
      className="gap-3 flex flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.Field
        name="todoEdit"
        children={(field) => {
          return (
            <InputSelector
              name="todoEdit"
              field={field}
              setIsNavigational={setIsNavigational}
              ref={ref}
              dispatch={dispatch}
              state={state}
            />
          );
        }}
      />

      <form.Subscribe
        selector={(state) => state.isSubmitting}
        children={(isSubmitting) => {
          return (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Editing..." : "Confirm Edit"}
            </Button>
          );
        }}
      />
    </form>
  );
};

export default DialogTodoEdit;
