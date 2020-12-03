with import <nixpkgs> {};

buildGoModule {
	pname = "EventHub";
	version = "0.0.1";
	src = nix-gitignore.gitignoreSource [] ./.;
	vendorSha256 = null;
}
