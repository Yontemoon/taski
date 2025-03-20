import { TAllTags, TTodos } from "@/types/tables.types";
import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTodoMutations } from "@/features/todo.id/hooks";
import { useDialog } from "@/context/dialog";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import InputSelector from "../input-selector";
import { useTagSelector } from "@/hooks/use-tag-selector";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth";

type PropTypes = {
  todo: TTodos;
};

const DialogEditTodo = ({ todo }: PropTypes) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const allTags = queryClient.getQueryData(["tags", user?.id]) as TAllTags[];

  const { setIsOpen } = useDialog();
  const { editMutation } = useTodoMutations(todo.user_id, todo.date_set);
  const { dispatch, state } = useTagSelector();
  const form = useForm({
    defaultValues: {
      todoEdit: todo.todo,
      todoEditAdditional: todo.additional_info || "",
    },
    onSubmit: async ({ value }) => {
      const data = {
        todo_id: todo.id,
        updated_todo: value.todoEdit,
        updated_additional_info: value.todoEditAdditional,
        user_id: todo.user_id,
      };
      console.log(data);

      editMutation.mutate(data);
      setIsOpen(false);
    },
  });
  return (
    <div>
      <DialogTitle>{todo.id}</DialogTitle>
      <DialogDescription asChild>
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
                  dispatch={dispatch}
                  state={state}
                  allTags={allTags}
                />
              );
            }}
          />
          <form.Field
            name="todoEditAdditional"
            children={(field) => {
              return (
                <>
                  <Label>Additional Info</Label>
                  <Textarea
                    rows={5}
                    name="todoEditAdditional"
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </>
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
      </DialogDescription>
    </div>
  );
};

export default DialogEditTodo;
