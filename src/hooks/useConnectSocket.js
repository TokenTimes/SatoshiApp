import {setSocket} from '../slices/globalSlice';
import {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {io} from 'socket.io-client';

const useConnectSocket = () => {
  const {authToken} = useSelector(state => state.global);
  const dispatch = useDispatch();
  const connectSocket = useCallback(() => {
    if (authToken) {
      const socketInstance = io('https://dev-user.olympus-demo.com/', {
        transports: ['websocket'], // Force WebSocket transport
        extraHeaders: {
          Authorization: `Bearer ${authToken}`,
          // "ngrok-skip-browser-warning": "true",
        },
      });
      dispatch(setSocket(socketInstance));
    }
  }, [authToken, setSocket]);
  return {connectSocket};
};

export default useConnectSocket;
