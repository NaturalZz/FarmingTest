export const notOwner = "Ownable: caller is not the owner"
export const ExistentialDeposit = "Multicurrency Transfer failed: ExistentialDeposit"
// stake
export const PoolNotExist = "invalid pool"
export const CannotStake0 = "cannot stake 0"
export const InsufficientAllowance = "insufficient allowance"
export const BalanceLow = "Multicurrency Transfer failed: BalanceTooLow"
export const TransferAmountExceeds = "transfer amount exceeds allowance" // execution reverted: ERC20: transfer amount exceeds allowance
// unstake
export const CannotUnstakeZero = "cannot unstake 0"
export const ShareNotEnough = "share not enough"
// notifyRewardRule
export const RewardTokenZero = "reward token is zero address"
export const PoolMustExist = "pool must be existed"
export const RewardDurationZero = "zero reward duration"
export const TooManyRewardType = "too many reward types"
// convert
export const AlreadyConverted = "already converted"
export const PoolIsEmpty = "pool is empty"
export const ShareTokenMustDOT = "share token must be DOT"
export const ShareTokenMustLcDOT = "share token must be LcDOT"
export const ShareTokenMustLDOT = "share token must be LDOT"
export const UnsupportedConvert = "unsupported convert"
export const ExchangeRateZero = "exchange rate shouldn't be zero"
// setRewardsDeductionRate
export const WrongRate = "invalid rate"
// setPoolOperationPaused
export const OperationPaused = "PoolOperationPausable: operation is paused for this pool"
export const AlreadyPaused = "execution reverted: Pausable: paused"
export const NotPaused = "execution reverted: Pausable: not paused"
// wrappedTDOTCase
export const InvalidWTDOT = "WTDOT: invalid WTDOT amount"
export const InvalidTDOT = "WTDOT: invalid TDOT amount"
export const WTDOTNotEnough = "WTDOT: WTDOT not enough"
// wrappedTUSDCase
export const InvalidWTUSD = "WTUSD: invalid WTUSD amount"
export const InvalidTUSD = "WTUSD: invalid TUSD amount"
export const WTUSDNotEnough = "WTUSD: WTUSD not enough"
// StableAssetStakeUtil
export const InvalidStableAssetPool = "invalid stable asset pool"
export const StableAssetMintFailed = "stable-asset mint failed"
export const ZeroMinted = "zero minted share amount is not allowed"
export const ZeroWrapped = "zero wrapped share amount is not allowed"
export const ZeroShare = "zero share amount is not allowed"
// Convertor
export const InvalidAmount= "invalid input amount"