import { useEffect } from "react";
import { useSpring, animated } from "react-spring";
export default function ErrorMessage({ statusMsg, setFunc }) {
  const [animation, api] = useSpring(() => ({
    from: {
      opacity: 0,
    },
    reset: true,
  }));

  useEffect(() => {
    if (statusMsg == ".") return;
    api.start({
      to: async (next) => {
        await next({ opacity: 0.999, config: { duration: 300 } });
        await next({ opacity: 1, config: { duration: 800 } });
        await next({ opacity: 0, config: { duration: 300 } }).then(() => {
          setFunc(".");
        });
      },
    });
  }, [statusMsg]);
  return (
    <animated.p style={animation} className="error_message">
      {statusMsg}
    </animated.p>
  );
}
