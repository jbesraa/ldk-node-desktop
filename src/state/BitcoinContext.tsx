import { invoke } from "@tauri-apps/api/tauri";
import { createContext, useContext, useState } from "react";

export interface BitcoinActions {
    connection: BitcoinConnection;
    create_wallet: () => Promise<string>;
}

export const useBitcoinContext = () => useContext(BitcoinContext);

export const BitcoinContext = createContext({} as BitcoinActions);

enum BitcoinConnection {
    Online,
    Offline,
}

export const BitcoinContextProvider = ({
    children,
}: {
    children: any;
}) => {
    const [connection, _setConnection] = useState<BitcoinConnection>(
        BitcoinConnection.Offline
    );

    async function create_wallet(): Promise<string> {
        try {
            const res: string = await invoke("create_wallet", {});
            return res;
        } catch (e) {
            console.log("Error get_our_address", e);
            return "";
        }
    }

    const state: BitcoinActions = {
        connection,
        create_wallet,
    };

    return (
        <BitcoinContext.Provider value={state}>
            {children}
        </BitcoinContext.Provider>
    );
};
