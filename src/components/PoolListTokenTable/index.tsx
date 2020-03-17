import React from 'react';
import {
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TablePagination,
    TableRow,
    Tooltip,
    Typography,
} from '@material-ui/core';
import * as helpers from 'utils/helpers';
import { TokenApproveToggle, TokenText } from 'components';
import { inject, observer } from 'mobx-react';

@inject('root')
@observer
class Index extends React.Component<any, any> {
    constructor(props) {
        super(props);

        this.state = {
            columns: [
                { label: 'Symbol', id: 'symbol', minWidth: 20 },
                { label: 'Address', id: 'Address', minWidth: 20 },
                { label: 'My balance', id: 'My balance', minWidth: 20 },
                { label: 'Pool balance', id: 'Pool balance', minWidth: 20 },
                { label: 'Weight', id: 'Weight', minWidth: 20 },
                { label: 'Lock/Unlock', id: 'lockable', minWidth: 20 },
                { label: 'Drip (Token Faucet)', id: 'mint', minWidth: 20 },
            ],
            rows: [],
            page: 0,
            rowsPerPage: 10,
        };
    }

    getTokenParams() {
        let tokenParams;

        const { displayMode, poolAddress } = this.props;
        const { poolStore } = this.props.root;
        const pool = poolStore.poolData[poolAddress];

        if (displayMode === 'whitelist+pool') {
            tokenParams = pool.whitelistTokenWeights;
        } else if (displayMode === 'pool') {
            tokenParams = pool.tokenWeights;
        }

        return tokenParams;
    }

    buildRowValues() {
        const { poolAddress, userAddress } = this.props;
        const { poolStore, tokenStore } = this.props.root;

        const tokenParams = this.getTokenParams();

        return Object.keys(tokenParams).map(token => {
            const weight = tokenParams[token];
            const symbol = tokenStore.symbols[token];
            const userBalance = tokenStore.getBalance(token, userAddress);
            const poolBalance = tokenStore.getBalance(token, poolAddress);
            const bound = poolStore.isTokenBound(poolAddress, token);

            return {
                symbol: symbol || '???',
                address: token,
                addressStub: helpers.toAddressStub(token),
                balance: poolBalance,
                weight,
                bound,
                userBalance: userBalance,
            };
        });
    }

    setPage(value) {
        this.setState({ page: value });
    }

    setRowsPerPage(value) {
        this.setState({ rowsPerPage: value });
    }

    handleChangePage(event, newPage) {
        this.setPage(newPage);
    }

    handleChangeRowsPerPage(event) {
        this.setRowsPerPage(Number(event.target.value));
        this.setPage(0);
    }

    render() {
        const { columns, page, rowsPerPage } = this.state;
        const { faucetStore } = this.props.root;
        const { poolAddress } = this.props;

        const rows = this.buildRowValues();

        return (
            <Paper>
                <div>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {columns.map(column => (
                                    <TableCell
                                        key={column.id}
                                        style={{ minWidth: column.minWidth }}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map(row => {
                                return (
                                    <TableRow
                                        hover
                                        role="checkbox"
                                        tabIndex={-1}
                                        key={row.address}
                                    >
                                        <TableCell key={`symbol${row.address}`}>
                                            <Typography>
                                                {row.symbol}
                                            </Typography>
                                        </TableCell>
                                        <TableCell
                                            key={`address${row.address}`}
                                        >
                                            <Tooltip
                                                title={row.address}
                                                interactive
                                            >
                                                <Typography>
                                                    {row.addressStub}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell
                                            key={`mybalance${row.address}`}
                                        >
                                            <TokenText
                                                weiValue={row.userBalance}
                                            />
                                        </TableCell>
                                        <TableCell
                                            key={`poolbalance${row.address}`}
                                        >
                                            <TokenText weiValue={row.balance} />
                                        </TableCell>
                                        <TableCell key={`weight${row.address}`}>
                                            <TokenText weiValue={row.weight} />
                                        </TableCell>
                                        <TableCell key={`toggl${row.address}`}>
                                            <TokenApproveToggle
                                                tokenAddress={row.address}
                                                poolAddress={poolAddress}
                                            />
                                        </TableCell>
                                        <TableCell key={`drip${row.address}`}>
                                            <Button
                                                onClick={() =>
                                                    faucetStore.drip(
                                                        row.address
                                                    )
                                                }
                                            >
                                                {' '}
                                                +{' '}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 100]}
                    component="div"
                    count={rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    backIconButtonProps={{
                        'aria-label': 'previous page',
                    }}
                    nextIconButtonProps={{
                        'aria-label': 'next page',
                    }}
                    onChangePage={this.handleChangePage}
                    onChangeRowsPerPage={this.handleChangeRowsPerPage}
                />
            </Paper>
        );
    }
}

export default Index;