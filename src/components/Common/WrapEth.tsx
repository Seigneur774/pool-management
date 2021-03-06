import React, { useState } from 'react';
import styled from 'styled-components';
import { useStores } from '../../contexts/storesContext';
import { toWei, formatBalance } from '../../utils/helpers';
import { ContractTypes } from '../../stores/Provider';
import { ethers } from 'ethers';

const Container = styled.div`
    font-family: var(--roboto);
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-bottom: 1px solid var(--panel-border);
    padding-bottom: 20px;
`;

const ButtonContainer = styled.div`
    font-family: var(--roboto);
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
`;

const EthButton = styled.div`
    border-radius: 4px;
    width: 70px;
    height: 38px;
    font-family: var(--roboto);
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    cursor: pointer;
    background: var(--selector-background);
    border: 1px solid var(--inactive-button-border);
    color: var(--inactive-button-text);

    &:hover {
        background: var(--button-background);
        border: 1px solid var(--button-border);
        color: var(--button-text);
    }
`;

const WethButton = styled(EthButton)`
    width: 70px;
`;

const WrapHeader = styled.div`
    align-items: left;
    font-family: Roboto;
    font-style: normal;
    font-weight: 500;
    font-size: 12px;
    line-height: 18px;
    padding-left: 30px;
    padding-top: 14px;
    color: var(--token-balance-text);
    text-transform: uppercase;
`;

const Advice = styled.div`
    align-items: left;
    font-family: Roboto;
    font-style: normal;
    font-weight: 500;
    font-size: 10px;
    line-height: 18px;
    padding-left: 30px;
    padding-top: 5px;
    color: var(--token-balance-text);
`;

// padding and width
const EthInputWrapper = styled.div`
    height: 38px;
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
    input {
        width: 85px;
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

const WethInputWrapper = styled(EthInputWrapper)`
    padding: 0px 5px;
`;

const WrapElement = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    color: var(--highlighted-selector-text);
    padding: 0px 30px 0px 30px;
    font-family: Roboto;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 22px;
    margin-top: 2px;
`;

const MaxLink = styled.div`
    font-weight: 500;
    font-size: 14px;
    line-height: 16px;
    display: flex;
    text-decoration-line: underline;
    color: var(--link-text);
    cursor: pointer;
`;

enum ButtonAction {
    WRAP,
    UNWRAP,
}

const WrapEth = () => {
    const [ethAmount, setEthAmount] = useState('');
    const [wethAmount, setWethAmount] = useState('');

    const {
        root: { providerStore, contractMetadataStore, tokenStore },
    } = useStores();

    const wethAddress = contractMetadataStore.getWethAddress();

    const handleMaxLinkClick = async () => {
        const account = providerStore.providerStatus.account;
        let maxValue = '0.00';

        if (account) {
            const balance = tokenStore.getBalance(wethAddress, account);

            maxValue = formatBalance(balance, 18, 20);
        }

        setWethAmount(maxValue);
        return maxValue;
    };

    const actionButtonHandler = async (action: ButtonAction) => {
        if (action === ButtonAction.WRAP) {
            let overrides = {
                value: ethers.utils.parseEther(ethAmount),
            };

            await providerStore.sendTransaction(
                ContractTypes.Weth,
                contractMetadataStore.getWethAddress(),
                'deposit',
                [],
                overrides
            );
        } else if (action === ButtonAction.UNWRAP) {
            let amountToUnwrap = toWei(wethAmount);

            await providerStore.sendTransaction(
                ContractTypes.Weth,
                contractMetadataStore.getWethAddress(),
                'withdraw',
                [amountToUnwrap.toString()]
            );
        }
    };

    return (
        <Container>
            <WrapHeader>Eth</WrapHeader>
            <WrapElement>
                <EthInputWrapper errorBorders={false}>
                    <input
                        name={`input-name-wrap`}
                        value={ethAmount}
                        onChange={e => setEthAmount(e.target.value)}
                        // ref={textInput}
                        placeholder=""
                    />
                </EthInputWrapper>

                <ButtonContainer>
                    <EthButton
                        buttonText={`WRAP`}
                        active={false}
                        onClick={e => actionButtonHandler(ButtonAction.WRAP)}
                    >
                        WRAP
                    </EthButton>
                </ButtonContainer>
            </WrapElement>
            <Advice>Keep some ETH unwrapped for transaction fees</Advice>

            <WrapHeader>WETH</WrapHeader>
            <WrapElement>
                <WethInputWrapper errorBorders={false}>
                    <MaxLink
                        onClick={() => {
                            handleMaxLinkClick();
                        }}
                    >
                        Max
                    </MaxLink>

                    <input
                        name={`input-name-wrap`}
                        value={wethAmount}
                        onChange={e => setWethAmount(e.target.value)}
                        // ref={textInput}
                        placeholder=""
                    />
                </WethInputWrapper>
                <ButtonContainer>
                    <WethButton
                        buttonText={`UNWRAP`}
                        active={false}
                        onClick={e => actionButtonHandler(ButtonAction.UNWRAP)}
                    >
                        UNWRAP
                    </WethButton>
                </ButtonContainer>
            </WrapElement>
        </Container>
    );
};

export default WrapEth;
