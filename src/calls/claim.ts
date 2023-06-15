import { AccountInterface } from "starknet";
import { afterTransaction } from "../utils/blockchain";
import GovernanceAbi from "../abi/governance_abi.json";
import { getTokenAddresses } from "../constants/amm";

export const claim = async (
  account: AccountInterface,
  data: string[],
  setText: (txt: string) => void
) => {
  const contractAddress = getTokenAddresses().GOVERNANCE_CONTRACT_ADDRESS;
  const [address, amount, ...proof] = data;
  const calldata = [address, amount, String(proof.length), ...proof];
  const call = {
    contractAddress,
    entrypoint: "claim",
    calldata,
  };
  const res = await account.execute(call, [GovernanceAbi]).catch(() => null);

  if (res === null) {
    setText("Transaction was rejected");
    return;
  }

  if (res && res.transaction_hash) {
    setText("Transaction is being processed, please be patient...");
    afterTransaction(
      res.transaction_hash,
      () => setText("Airdrop successfully sent to your wallet!"),
      () => setText("Transaction failed")
    );
  } else {
    setText(
      "Something went wrong, please get in touch in the Support chanell on our Discord"
    );
  }
};
