fn main() -> Result<(), Box<dyn std::error::Error>> {
    tonic_build::compile_protos("proto/walletrpc.proto")?;
    tauri_build::build();
    Ok(())
}
