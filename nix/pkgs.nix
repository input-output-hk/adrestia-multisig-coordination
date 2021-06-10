{ sources ? import ./sources.nix }:

let
  iohkNix = import sources.iohk-nix {};
  overlay = self: super: {
    packages = self.callPackages ./packages.nix { };
    iohkNix = import sources.iohk-nix {};
    yarn2nix = self.yarn2nix-moretea.yarn2nix;
  };
in
  import iohkNix.nixpkgs { overlays = [ overlay ]; config = {}; }
