// scripts/getOwner.js

const { ethers } = require("hardhat");

async function main() {
  // Récupérer les signataires (les comptes)
  const [deployer] = await ethers.getSigners();

  // Charger le contrat Voting depuis le contrat ABI et bytecode
  const Voting = await ethers.getContractFactory("Voting");

  // Déployer le contrat
  const voting = await Voting.deploy();

  // Attendre que la transaction soit confirmée (ce qui permet au contrat d'être déployé sur la blockchain)
  console.log("Contract deploying... Waiting for confirmation...");
  await voting.deployTransaction.wait(); // Attente de la confirmation de déploiement

  // Récupérer l'adresse du propriétaire via la fonction "owner()"
  const owner = await voting.owner();

  // Afficher l'adresse du propriétaire
  console.log("Owner address:", owner);
}

// Exécuter le script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
