import { createContext, useContext, useState } from "react";
import { HomeScreen } from "../pages";

export interface RouterActions {
	push_route: (s: string) => void;
	current_route: string;
}

export const useRouterContext = () => useContext(RouterContext);

export const RouterContext = createContext({} as RouterActions);

export const RouterContextProvider = ({
	children,
}: {
	children: any;
}) => {
	const [current_route, setCurrentRoute] = useState("home");

	function push_route(s: string) {
		setCurrentRoute(s);
	}
	const state: RouterActions = {
		push_route,
		current_route,
	};

	return (
		<RouterContext.Provider value={state}>
			{children}
		</RouterContext.Provider>
	);
};

export function Router() {
	const { current_route } = useRouterContext();

	if (current_route === "home") {
		return <HomeScreen />;
	}
}
