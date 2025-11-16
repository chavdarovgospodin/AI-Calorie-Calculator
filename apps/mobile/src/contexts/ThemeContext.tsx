import { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';

type ThemeContextType = {
  theme: string | null | undefined;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: Appearance.getColorScheme(),
});

import { ReactNode } from 'react';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState(Appearance.getColorScheme());

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme);
    });
    return () => subscription.remove();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
