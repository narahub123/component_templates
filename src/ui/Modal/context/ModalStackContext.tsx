import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ModalStackContextValue = {
  stack: string[]; // 현재 활성화된 모달 ID 스택.
  register: (id: string) => void; // 모달이 마운트될 때 스택에 추가한다.
  unregister: (id: string) => void; // 모달이 언마운트될 때 스택에서 제거한다.
  isTop: (id: string) => boolean; // 주어진 모달이 스택 최상단인지 여부를 확인한다.
};

const ModalStackContext = createContext<ModalStackContextValue | null>(null);

type ModalStackProviderProps = {
  children: ReactNode;
};

const ModalStackProvider = ({ children }: ModalStackProviderProps) => {
  const [stack, setStack] = useState<string[]>([]);

  const register = useCallback((id: string) => {
    setStack((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const unregister = useCallback((id: string) => {
    setStack((prev) => prev.filter((item) => item !== id));
  }, []);

  const isTop = useCallback(
    (id: string) => stack[stack.length - 1] === id,
    [stack]
  );

  const value = useMemo(
    () => ({
      stack,
      register,
      unregister,
      isTop,
    }),
    [stack, register, unregister, isTop]
  );

  return (
    <ModalStackContext.Provider value={value}>
      {children}
    </ModalStackContext.Provider>
  );
};

const useModalStackContext = () => {
  const context = useContext(ModalStackContext);

  if (!context) {
    throw new Error("useModalStackContext must be used within ModalStackProvider");
  }

  return context;
};

export { ModalStackContext, ModalStackProvider, useModalStackContext };

