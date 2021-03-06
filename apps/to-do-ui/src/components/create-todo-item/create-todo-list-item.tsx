import { zodResolver } from '@hookform/resolvers/zod';
import { ExpandMore } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  Divider,
  ListItem,
  ListItemAvatar,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import {
  StatusIds,
  todoCreateSchema,
  TodoCreateType,
  TodoStatusDetailType,
} from '@to-do/api-schemas/todo-schema';
import { UserDetailType } from '@to-do/api-schemas/user-schema';
import todoService from '@to-do/services/to-do-service-fe';
import { useContext, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AppContext } from '../../context/app-context';
import DateAdapter from '@mui/lab/AdapterDateFns';
import { DesktopDatePicker, LocalizationProvider } from '@mui/lab';

export interface CreateTodoListItemProps {
  todoCreated: () => void;
  users: UserDetailType[];
  statuses: TodoStatusDetailType[];
}

const stopProp = (e: React.MouseEvent<HTMLElement, MouseEvent> | undefined) =>
  e?.stopPropagation();

export const getUserAvatarSelectList = (
  users: UserDetailType[],
  current: number,
  handleAssignedToChange: (event: SelectChangeEvent<number>) => void
) => {
  return (
    <Tooltip title='Assigned to'>
      <ListItemAvatar onClick={(e) => e.stopPropagation()}>
        <Select
          variant='standard'
          value={current}
          disableUnderline
          onChange={handleAssignedToChange}
          onClick={stopProp}
          IconComponent={() => null}
          inputProps={{ sx: { padding: '0 !important' } }}
        >
          {users.map((user) => (
            <MenuItem key={user.id} value={user.id}>
              <Tooltip title={user.username}>
                <Avatar alt={user.username}>
                  {user.username.substring(0, 1)}
                </Avatar>
              </Tooltip>
            </MenuItem>
          ))}
        </Select>
      </ListItemAvatar>
    </Tooltip>
  );
};

export const getStatusSelectList = (
  statuses: TodoStatusDetailType[],
  current: number,
  handleStatusChange: (event: SelectChangeEvent<number>) => void
) => {
  return (
    <Select
      variant='standard'
      disableUnderline
      value={current}
      onChange={handleStatusChange}
      onClick={stopProp}
    >
      {statuses.map((status) => (
        <MenuItem key={status.id} value={status.id}>
          {status.name}
        </MenuItem>
      ))}
    </Select>
  );
};

const CreateTodoListItem = (props: CreateTodoListItemProps) => {
  const { auth, session } = useContext(AppContext);
  const [expanded, setExpanded] = useState<boolean>(false);
  const defaultData: Partial<TodoCreateType> = {
    status: StatusIds.ToDo,
    assignedToId: session?.userId,
    title: undefined,
    deadline: null,
    description: null,
    session: undefined,
  };
  const [data, setData] = useState<Partial<TodoCreateType>>(defaultData);

  useEffect(() => {
    if (session) {
      setData((currentData) => ({
        ...currentData,
        assignedToId: session.userId,
        session,
      }));
    }
  }, [session]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TodoCreateType>({
    mode: 'onChange',
    resolver: zodResolver(todoCreateSchema),
    defaultValues: data,
  });

  const [submitted, setSubhmitted] = useState<boolean>(false);
  useEffect(() => {
    if (submitted) {
      reset(defaultData);
      props.todoCreated();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted]);

  const handleStatusChange = async (event: SelectChangeEvent<number>) => {
    const newStatus = event.target.value as number;
    setData({ ...data, status: newStatus });
  };

  const handleAssignedToChange = async (event: SelectChangeEvent<number>) => {
    const newUser = event.target.value as number;
    setData({ ...data, assignedToId: newUser });
  };

  const onSubmit = async (todoCreate: TodoCreateType) => {
    auth?.authToken &&
      (await todoService.createTodo(auth.authToken, todoCreate));
    setSubhmitted(true);
  };

  return (
    <>
      <ListItem sx={{ marginBottom: 2 }}>
        <Box
          sx={{ width: '100%' }}
          component='form'
          onSubmit={handleSubmit(onSubmit)}
        >
          <Accordion
            expanded={expanded}
            onChange={() => setExpanded(!expanded)}
            sx={{
              boxShadow:
                'rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;',
            }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              {props.users?.length &&
                getUserAvatarSelectList(
                  props.users,
                  data.assignedToId ?? 0,
                  handleAssignedToChange
                )}
              <Controller
                name='title'
                control={control}
                render={({ field: { ref, ...field } }) => (
                  <TextField
                    label='Title'
                    type='text'
                    fullWidth
                    variant='standard'
                    autoComplete='title'
                    InputLabelProps={{ shrink: true }}
                    onClick={stopProp}
                    error={Boolean(errors.title)}
                    helperText={errors.title?.message}
                    inputRef={ref}
                    {...field}
                  />
                )}
              />
              {props.statuses?.length &&
                getStatusSelectList(
                  props.statuses,
                  data.status ?? StatusIds.ToDo,
                  handleStatusChange
                )}
            </AccordionSummary>

            <AccordionDetails>
              <Stack spacing={3}>
                <Controller
                  name='description'
                  control={control}
                  render={({ field: { ref, ...field } }) => (
                    <TextField
                      label='Description'
                      type='text'
                      fullWidth
                      variant='standard'
                      InputLabelProps={{ shrink: true }}
                      multiline
                      onClick={stopProp}
                      error={Boolean(errors.description)}
                      helperText={errors.description?.message}
                      inputRef={ref}
                      {...field}
                    />
                  )}
                />
                <LocalizationProvider dateAdapter={DateAdapter}>
                  <Controller
                    name='deadline'
                    control={control}
                    render={({ field: { ref, ...field } }) => (
                      <DesktopDatePicker
                        label='Deadline'
                        inputFormat='dd/MM/yyyy'
                        value={field.value}
                        onChange={field.onChange}
                        inputRef={ref}
                        renderInput={(params) => (
                          <TextField
                            variant='standard'
                            InputLabelProps={{ shrink: true }}
                            error={Boolean(errors.deadline)}
                            helperText={errors.deadline?.message}
                            inputRef={ref}
                            {...params}
                          />
                        )}
                      />
                    )}
                  />
                </LocalizationProvider>

                <Stack spacing={2} textAlign='right' direction='row-reverse'>
                  {expanded && (
                    <>
                      <Button
                        size='small'
                        type='submit'
                        variant='contained'
                        onClick={(e) => {
                          stopProp(e);
                          setExpanded(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type='submit'
                        variant='contained'
                        onClick={(e) => {
                          stopProp(e);
                        }}
                      >
                        Save
                      </Button>
                    </>
                  )}
                </Stack>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Box>
      </ListItem>
      <Divider variant='middle' component='li' />
    </>
  );
};

export default CreateTodoListItem;
