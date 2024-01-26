use directories::UserDirs;

const PROJECT_FOLDER_NAME: &str = ".bits-wallet";

pub struct UserPaths;

impl UserPaths {
    pub fn new() -> Self {
        UserPaths
    }

    pub fn home_dir(&self) -> String {
        let home_dir = match UserDirs::new() {
            Some(user_dirs) => match user_dirs.home_dir().to_str() {
                Some(home_dir) => home_dir.to_string(),
                None => panic!("Could not convert home directory to string"),
            },
            None => panic!("Could not find home directory"),
        };
        home_dir
    }

    pub fn project_base_dir(&self) -> String {
        format!("{}/{}", self.home_dir(), PROJECT_FOLDER_NAME)
    }

    pub fn wallets_dir(&self) -> String {
        format!("{}/wallets", self.project_base_dir())
    }

    pub fn wallet_dir(&self, wallet_name: &str) -> String {
        format!("{}/{}", self.wallets_dir(), wallet_name)
    }

    pub fn seed_file(&self, wallet_name: &str) -> String {
        format!("{}/seed", self.wallet_dir(wallet_name))
    }

    pub fn config_file(&self, wallet_name: &str) -> String {
        format!("{}/config.json", self.wallet_dir(wallet_name))
    }

    pub fn ldk_data_dir(&self, wallet_name: &str) -> String {
        format!("{}/ldk-data", self.wallet_dir(wallet_name))
    }
}
