
with import <nixpkgs> {};

stdenv.mkDerivation {
	pname = "EventHub-ui";
	version = "0.1.0";
	src = nix-gitignore.gitignoreSource [] ./.;
	buildInputs = [nodejs];
	buildPhase = ''
		npm run build
	'';
	installPhase = ''
		cp -r ./build $out/
	'';
}
