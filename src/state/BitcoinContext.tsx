import axios from "axios";
import { createContext, useContext, useState } from "react";
import { trace, info, error } from "tauri-plugin-log-api";

export interface BitcoinActions {
    connectToEsplora: (s: string) => Promise<boolean>;
    currentBlock: () => Promise<number>;
    esploraUrl: string;
    connection: BitcoinConnection;
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
    const [connection, setConnection] = useState<BitcoinConnection>(
        BitcoinConnection.Offline
    );
    const [esploraUrl, setEsploraUrl] = useState<string>("");

    async function currentBlock(): Promise<number> {
        try {
            const block = `${esploraUrl}/blocks/tip/height`;
            const response = await axios.get(block);
            if (response.status < 300 && response.status > 199) {
                console.log(response.data);
                return Number(response.data);
            }
            return 1;
        } catch (err) {
            console.log(err);
            return 2;
        }
    }

    async function connectToEsplora(
        esploraUrl: string
    ): Promise<boolean> {
        try {
            const head = `${esploraUrl}/blocks/tip/height`;
            info(`Esplora URL: ${head}`);
            const response = await axios.get(head);
            info(`Esplora Response status: ${response.status}`);
            info(`Esplora Response data: ${response.data}`);
            if (response.status < 300 && response.status > 199) {
                setEsploraUrl(esploraUrl);
                setConnection(BitcoinConnection.Online);
                return true;
            }
            return false;
        } catch (err) {
            error(`Esplora Error: ${err}`);
            console.log(err);
            return false;
        }
    }

    const state: BitcoinActions = {
        connectToEsplora,
        currentBlock,
        esploraUrl,
        connection,
    };

    return (
        <BitcoinContext.Provider value={state}>
            {children}
        </BitcoinContext.Provider>
    );
};
