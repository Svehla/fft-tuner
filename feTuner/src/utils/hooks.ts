import { useEffect } from "react";

export const useComponentDidMount = (fn: () => void | Promise<void>) => {
  useEffect(() => {
    const main = async () => {
      try {
        await fn();
      } catch (err) {
        console.error(err);
        alert(err.toString());
      }
    };
    main();
  }, []);
};
