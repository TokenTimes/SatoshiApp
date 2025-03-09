import useConnectSocket from '../../../hooks/useConnectSocket';
import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';

const SocketProvider = ({children}) => {
  const {connectSocket} = useConnectSocket();
  const {authToken} = useSelector(state => state.global);

  useEffect(() => {
    if (authToken) {
      connectSocket();
    }
  }, [authToken]);
  return <>{children}</>;
};

export default SocketProvider;
