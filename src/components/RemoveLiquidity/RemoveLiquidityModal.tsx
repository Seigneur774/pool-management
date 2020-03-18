import React from 'react';
import styled from 'styled-components';
import PoolOverview from '../Common/PoolOverview';
import Button from '../Common/Button';
import RemoveAssetTable from './RemoveAssetTable';
import {observer} from 'mobx-react';
import {useStores} from '../../contexts/storesContext';
import {Pool, PoolToken} from '../../types';
import {ContractTypes} from "../../stores/Provider";
import {ModalMode} from "../../stores/AddLiquidityForm";
import {bnum, formatPercentage, fromPercentage} from "../../utils/helpers";

const Container = styled.div`
    display: block;
    position: fixed;
    z-index: 5;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto; /* Enable scroll if needed */
    background-color: rgb(0, 0, 0);
    background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
`;

const ModalContent = styled.div`
    position: relative;
    margin: 15% auto;
    display: flex;
    flex-direction: column;
    max-width: 862px;
    background-color: var(--panel-background);
    border: 1px solid var(--panel-border);
    border-radius: 4px;
    color: white;
`;

const RemoveLiquidityHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 68px;
    padding: 0px 20px;
    background-color: var(--panel-header-background);
    color: var(--header-text);
    border-bottom: 1px solid var(--panel-border);
    padding: 0px 20px 0px 20px;
`;

const RemoveLiquidityBody = styled.div`
    padding: 0px 20px 32px 20px;
`;

const HeaderContent = styled.div``;

const ExitComponent = styled.div`
    color: var(--exit-modal-color);
    transform: rotate(135deg);
    font-size: 22px;
    cursor: pointer;
`;

const RemoveLiquidityContent = styled.div`
    display: flex;
    flex-direction: row;
    margin-bottom: 20px
`;

const Notification = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    width: 100%;
    border: 1px solid var(--panel-border);
    background: var(--panel-background);
    margin-bottom: 30px;
`;

const WithdrawWrapper = styled.div`
	display: flex;
	width: 100%;
	flex-direction: column;
	align-items: center;
	background: var(--panel-background);
	margin-bottom: 30px;
`

const WithdrawAmountWrapper = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	width: 100%;
	margin-bottom: 10px;
`

const InputWrapper = styled.div`
    height: 30px;
    padding: 0px 17px;
    font-family: Roboto;
    font-style: normal;
    font-weight: 500;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border: 1px solid var(--panel-border);
    border-radius: 4px;
    margin: 0px 5px 0px 10px;
    input {
        width: 70px;
        text-align: right;
        color: var(--input-text);
        font-size: 14px;
        font-weight: 500;
        line-height: 16px;
        letter-spacing: 0.2px;
        padding-left: 5px;
        background-color: var(--panel-background);
        border: none;
        box-shadow: inset 0 0 0 1px var(--panel-background),
            inset 0 0 0 70px var(--panel-background);
        :-webkit-autofill,
        :-webkit-autofill:hover,
        :-webkit-autofill:focus,
        :-webkit-autofill:active,
        :-internal-autofill-selected {
            -webkit-text-fill-color: var(--body-text);
        }
        ::placeholder {
            color: var(--input-placeholder-text);
        }
        :focus {
            outline: none;
        }
    }
    border: ${props =>
        props.errorBorders ? '1px solid var(--error-color)' : ''};
    margin-left: ${props => (props.errorBorders ? '-1px' : '0px')}
    margin-right: ${props => (props.errorBorders ? '-1px' : '0px')}
    :hover {
        background-color: var(--input-hover-background);
        border: ${props =>
            props.errorBorders
                ? '1px solid var(--error-color)'
                : '1px solid var(--input-hover-border);'};
        margin-left: -1px;
        margin-right: -1px;
        input {
            background-color: var(--input-hover-background);
            box-shadow: inset 0 0 0 1px var(--input-hover-background),
                inset 0 0 0 70px var(--input-hover-background);
            ::placeholder {
                color: var(--input-hover-placeholder-text);
                background-color: var(--input-hover-background);
            }
        }
    }
`;

interface Props {
    poolAddress: string;
}

const RemoveLiquidityModal = observer((props: Props) => {
    const { poolAddress } = props;
    const {
        root: {
            poolStore,
            tokenStore,
            providerStore,
            removeLiquidityFormStore,
        },
    } = useStores();

    const web3React = providerStore.getActiveWeb3React();
    const { account } = web3React;

    const pool = poolStore.getPool(poolAddress);

    let loading = true;

    if (pool && !account) {
        loading = false;
    }

    const currentTotal = tokenStore.getTotalSupply(pool.address);
    const requiredDataPresent = pool && currentTotal;

    if (requiredDataPresent) {
        loading = false;
    }

    const handleShareToWithdrawChange = (event) => {
        const { value } = event.target;
        removeLiquidityFormStore.setShareToWithdraw(value);
        if (account && removeLiquidityFormStore.hasValidInput()) {
            const userShare = poolStore.getUserShareProportion(pool.address, account);
            if (userShare) {
                removeLiquidityFormStore.shareToWithdrawPercentageCheck(userShare);
            }
        }
    };

    const handleRemoveLiquidity = () => {};

    const renderNotification = () => {
        let currentPoolShare = '-';
        let futurePoolShare = '-';

        let existingShare = account
            ? poolStore.getUserShareProportion(pool.address, account)
            : bnum(0);

        if (!existingShare) {
            existingShare = bnum(0);
        }

        if (requiredDataPresent) {
            const shareToWithdraw = removeLiquidityFormStore.hasValidInput()
                ? poolStore.calcPoolTokensByRatio(
                    pool,
                    bnum(removeLiquidityFormStore.getShareToWithdraw())
                )
                : bnum(0);

            const tokensToWithdraw = fromPercentage(shareToWithdraw).times(currentTotal);

            const futureTotal = currentTotal.minus(tokensToWithdraw);
            const futureShare = tokensToWithdraw
                .div(futureTotal)
                .plus(existingShare);

            currentPoolShare = formatPercentage(existingShare, 2);
            futurePoolShare = formatPercentage(futureShare, 2);
        }

        if (!account) {
            return <Notification>Connect wallet to remove liquidity</Notification>;
        }
        if (removeLiquidityFormStore.hasValidInput()) {
            const text = account ? (
                <React.Fragment>
                    Your pool share will go from {currentPoolShare} to
                    {futurePoolShare}
                </React.Fragment>
            ) : (
                <React.Fragment>
                    Your pool share would increase by {futurePoolShare}
                </React.Fragment>
            );
            return <Notification>{text}</Notification>;
        } else {
            return (
                <WithdrawWrapper>
                    <WithdrawAmountWrapper>
	                    Withdraw
	                    <InputWrapper>
	                    	<input />
	                    </InputWrapper>
	                    %
	                </WithdrawAmountWrapper>
	                <div>You own X% of pool liquidity</div>
                </WithdrawWrapper>
            );
        }
    };

    const renderActionButton = () => {
        const active = account && removeLiquidityFormStore.hasValidInput();

        return (
            <Button
                buttonText={`Remove Liquidity`}
                active={active}
                onClick={e => handleRemoveLiquidity()}
            />
        );
    };

    const modalOpen = removeLiquidityFormStore.modalOpen;

    return (
        <Container style={{ display: modalOpen ? 'block' : 'none' }}>
            <ModalContent>
                <RemoveLiquidityHeader>
                    <HeaderContent>Remove Liquidity</HeaderContent>
                    <ExitComponent
                        onClick={() => removeLiquidityFormStore.closeModal()}
                    >
                        +
                    </ExitComponent>
                </RemoveLiquidityHeader>
                <RemoveLiquidityBody>
                    <RemoveLiquidityContent>
                        <PoolOverview poolAddress={poolAddress} />
                        <RemoveAssetTable poolAddress={poolAddress} />
                    </RemoveLiquidityContent>
                    {loading ? (
                        <div>Loading</div>
                    ) : (
                        <React.Fragment>
                            {renderNotification()}
                            {renderActionButton()}
                        </React.Fragment>
                    )}
                </RemoveLiquidityBody>
            </ModalContent>
        </Container>
    );
});

export default RemoveLiquidityModal;
