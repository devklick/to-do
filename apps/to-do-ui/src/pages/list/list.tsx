import { useContext, useEffect, useRef, useState } from 'react';
import { AppContext } from '../../context/app-context';
import { List as MuiList } from '@mui/material';
import TodoListItem from '../../components/todo-list-item';
import { useNavigate } from 'react-router-dom';
import {
  TodoDetailType,
  TodoStatusDetailType,
} from '@to-do/api-schemas/todo-schema';
import todoService from '@to-do/services/to-do-service-fe';
import { UserDetailType } from '@to-do/api-schemas/user-schema';
import userService from '@to-do/services/user-service-fe';
import CreateTodoListItem from '../../components/create-todo-item';
import NavMenu from '../../components/nav-menu';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ListProps {}

const List = () => {
  const { assumeLoggedIn, loadingStoredAuth, auth, session } =
    useContext(AppContext);
  const loggedIn = assumeLoggedIn();
  const navigate = useNavigate();

  const [todos, setTodos] = useState<TodoDetailType[]>([]);
  const [users, setUsers] = useState<UserDetailType[]>([]);
  const [statuses, setStatueses] = useState<TodoStatusDetailType[]>([]);
  const currentUserRef = useRef<UserDetailType | null>(null);

  const getTodos = async (token: string) => {
    setTodos(await todoService.getTodoList(token));
  };

  useEffect(() => {
    auth?.authToken && getTodos(auth?.authToken);
  }, [auth]);

  useEffect(() => {
    const getUsers = async (token: string) => {
      const _users = await userService.getUsers(token);
      setUsers(_users);

      const currentUser = _users.find(
        (u) => session && u.id === session.userId
      );
      if (currentUser) {
        currentUserRef.current = currentUser;
      }
    };
    if (auth?.authToken) {
      getUsers(auth.authToken);
    }
  }, [auth, session]);

  useEffect(() => {
    const getStatuses = async (token: string) => {
      setStatueses(await todoService.getStatuses(token));
    };
    if (auth?.authToken) {
      getStatuses(auth.authToken);
    }
  }, [auth]);

  const handleTodoCreated = async () => {
    auth?.authToken && getTodos(auth?.authToken);
  };

  // If the context tells that the local data has been loaded and
  // there's nothing to suggest that the user is authenticated,
  // redirect them to the login page to authenticate
  useEffect(() => {
    if (!loggedIn && !loadingStoredAuth) {
      navigate('/login');
    }
  }, [loggedIn, navigate, loadingStoredAuth]);

  return (
    <>
      <NavMenu currentUsername={currentUserRef.current?.username ?? 'X'} />
      <MuiList sx={{ width: '100%', maxWidth: '100%' }}>
        <CreateTodoListItem
          todoCreated={handleTodoCreated}
          users={users}
          statuses={statuses}
        />
        {todos.map((item, i) => (
          <TodoListItem key={i} data={item} users={users} statuses={statuses} />
        ))}
      </MuiList>
    </>
  );
};
export default List;
