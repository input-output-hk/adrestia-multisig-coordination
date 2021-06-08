{ lib, pkgs }:

let
  packages = self: {
    sources = import ./sources.nix;
    nodejs = pkgs.nodejs-12_x;
    yarn = pkgs.yarn.override { nodejs = self.nodejs; };
    nix-inclusive = pkgs.callPackage "${self.sources.nix-inclusive}/inclusive.nix" {};
    inherit (self.yarn-static.passthru) offlinecache;
    multisig-coordination-server = self.callPackage ./multisig-coordination-server.nix {};
  };
in pkgs.lib.makeScope pkgs.newScope packages
