import { createContext, useContext, useState } from "react";

export interface BitcoinActions {
    connectToEsplora: (s: string) => Promise<boolean>;
    currentBlock: () => Promise<number>;
    esploraUrl: string,
    connection: BitcoinConnection
}

export const useBitcoinContext = () => useContext(BitcoinContext);

export const BitcoinContext = createContext({} as BitcoinActions);

enum BitcoinConnection {
    Online,
    Offline
}

export const BitcoinContextProvider = ({
	children,
}: {
	children: any;
}) => {
    const [connection, setConnection] = useState<BitcoinConnection>(BitcoinConnection.Offline);
    const [esploraUrl, setEsploraUrl] = useState<string>("");

    async function currentBlock(): Promise<number> {
        try {
            const block = `${esploraUrl}/currentBlock`;
            const response = await axios.get(block);
            if(response.is_ok()) {
                return Number(response.data)
            }
            return 0;
        } catch(err) {
            console.log(err);
            return 0;
        }
    }

    async function connectToEsplora(esploraUrl: string): Promise<boolean> {
        try {
            const head = `${esploraUrl}/block/head/tip`;
            const response = await axios.get(head);
            if(response.is_ok()) {
                setEsploraUrl(esploraUrl);
                setConnection(BitcoinConnection.Online);
                return true;
            }
            return false;
        } catch(err) {
            console.log(err);
            return false;
        }
    }

	const state: BitcoinActions = {
        connectToEsplora,
        currentBlock,
        esploraUrl,
        connection
	};

	return (
		<BitcoinContext.Provider value={state}>
			{children}
		</BitcoinContext.Provider>
	);
};

