use hmac::{Hmac, Mac};
use jwt::{SignWithKey, VerifyWithKey};
use sha2::Sha256;
use std::collections::BTreeMap;

// Create a new JWT for an account
#[tauri::command]
pub fn create_account(name: &str, node_name: &str) -> String {
    let key: Hmac<Sha256> = Hmac::new_from_slice(b"some-secret").unwrap();
    let mut claims = BTreeMap::new();
    claims.insert("sub", name);
    claims.insert("node", node_name);
    let token = claims.sign_with_key(&key).unwrap();
	token
}

// Returns the account associated with the token
pub fn verify_jwt(token: &str) -> (String, String) {
    let key: Hmac<Sha256> = Hmac::new_from_slice(b"some-secret").unwrap();
    let claims: BTreeMap<String, String> = token.verify_with_key(&key).unwrap();
	(claims["sub"].clone(), claims["node"].clone())
}
