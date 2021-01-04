############################################################################
#
# Hydra release jobset.
#
# The purpose of this file is to select jobs defined in default.nix and map
# them to all supported build platforms.
#
############################################################################
{
  multisig-coordination-server ? { rev = null; }
}:

let
  sources = import ./nix/sources.nix;
  pkgs = import ./nix/pkgs.nix {};

in

pkgs.lib.fix (self: {
  inherit ( import ./. {} ) multisig-coordination-server;
  build-version = pkgs.writeText "version.json" (builtins.toJSON { inherit (multisig-coordination-server) rev; });
  required = pkgs.releaseTools.aggregate {
    name = "required";
    constituents = with self; [
      build-version
    ];
  };
})
