{ pkgs ? import ./nix/pkgs.nix {} }:

{
  inherit (pkgs.packages) multisig-coordination-server;
}
