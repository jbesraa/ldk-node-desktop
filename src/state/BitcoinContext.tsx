import { invoke } from "@tauri-apps/api/tauri";
import {
    createContext,
    useContext,
    useState,
} from "react";
import { CreateWalletInput } from "../types";

export interface BitcoinActions {
    connection: BitcoinConnection;
    create_wallet: (i: CreateWalletInput) => Promise<string>;
    list_wallets: () => Promise<string[]>;
    load_wallet: (n: string) => Promise<any>;
    get_new_address: (n: string) => Promise<string>;
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

    async function create_wallet(
        i: CreateWalletInput
    ): Promise<string> {
        try {
            const res: string = await invoke("create_wallet", {
                ...i,
            });
            return res;
        } catch (e) {
            console.log("Error get_our_address", e);
            return "";
        }
    }

    async function list_wallets(): Promise<string[]> {
        try {
            const res: string[] = await invoke("list_wallets");
            return res;
        } catch (e) {
            console.log("Error list wallets", e);
            return [];
        }
    }

    async function load_wallet(name: string): Promise<any> {
        try {
            const res = await invoke("load_wallet", {
                name
            });
            console.log(res);
            return res;
        } catch (e) {
            console.log("Error load wallet", e);
            return [];
        }
    }

    async function get_new_address(walletName: string): Promise<string> {
        try {
            const res: string = await invoke("get_new_address", {
                walletName
            });
            return res;
        } catch (e) {
            console.log("Error get new address", e);
            return "";
        }
    }

    const state: BitcoinActions = {
        connection,
        create_wallet,
        list_wallets,
        load_wallet,
        get_new_address
    };

    return (
        <BitcoinContext.Provider value={state}>
            {children}
        </BitcoinContext.Provider>
    );
};
