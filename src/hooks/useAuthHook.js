import {ROUTES} from '../utils/routes';
import {useRouter} from 'next/router';
import {useLayoutEffect} from 'react';
import {useSelector} from 'react-redux';

const useAuthHook = () => {
  const router = useRouter();
  const {authToken} = useSelector(state => state.global);

  useLayoutEffect(() => {
    if (authToken) {
      router.push(ROUTES.HOME);
    }
  }, [authToken, router, ROUTES]);
};

export default useAuthHook;
