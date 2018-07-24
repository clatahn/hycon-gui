import * as React from "react"
import update = require("react-addons-update")
import { Link } from "react-router-dom"
import { NotFound } from "./notFound"
import { IBlock, IResponseError, IRest, ITxProp } from "./rest"
import { TxLine } from "./txLine"
interface IBlockProps {
    rest: IRest
    hash: string
    notFound: boolean
}

interface IBlockViewState {
    rest: IRest
    block?: IBlock
    txs: ITxProp[]
    hash: string
    amount?: string
    fees?: string
    length?: number
    volume?: string
    notFound: boolean
    hasMore: boolean
    index: number
}
export class BlockView extends React.Component<IBlockProps, IBlockViewState> {
    constructor(props: IBlockProps) {
        super(props)
        this.state = {
            hasMore: true,
            hash: props.hash,
            index: 1,
            notFound: false,
            rest: props.rest,
            txs: [],
        }
        this.fetchBlock(props.hash)
    }
    public componentWillReceiveProps(nextProp: IBlockProps) {
        this.setState(nextProp)
        this.fetchBlock(nextProp.hash)
    }

    public render() {
        let txIndex = 0
        if (this.state.notFound) {
            return <NotFound />
        }
        if (!this.state.notFound && this.state.block === undefined) {
            return null
        }
        const date = new Date(this.state.block.timeStamp)
        return (
            <div>
                <div className="contentTitle">Block #{this.state.block.height}</div>
                <table className="table_margined blockTable">
                    <thead>
                        <tr>
                            <th colSpan={2} className="tableBorder_Header tableHeader_floatLeft">Summary</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="tdSubTitle subTitle_width20">Hash</td>
                            <td>{this.state.hash}</td>
                        </tr>
                        <tr>
                            <td className="tdSubTitle subTitle_width20">Previous Hash</td>
                            <td>
                                <Link to={`/block/${this.state.block.prevBlock}`}>
                                    {this.state.block.prevBlock}
                                </Link>
                            </td>
                        </tr>
                        <tr>
                            <td className="tdSubTitle subTitle_width20">Merkle Root</td>
                            <td>{this.state.block.merkleRoot}</td>
                        </tr>
                        <tr>
                            <td className="tdSubTitle subTitle_width20">State Root</td>
                            <td>{this.state.block.stateRoot}</td>
                        </tr>
                        <tr>
                            <td className="tdSubTitle subTitle_width20">Result Hash</td>
                            <td>{this.state.block.resultHash}</td>
                        </tr>
                        <tr>
                            <td className="tdSubTitle subTitle_width20">Difficulty</td>
                            <td>{this.state.block.difficulty}</td>
                        </tr>
                        <tr>
                            <td className="tdSubTitle subTitle_width20">Nonce</td>
                            <td>{this.state.block.nonce}</td>
                        </tr>
                        <tr>
                            <td className="tdSubTitle subTitle_width20">Miner</td>
                            <td>
                                <Link to={`/address/${this.state.block.miner}`}>
                                    {this.state.block.miner}
                                </Link>
                            </td>
                        </tr>
                        <tr>
                            <td className="tdSubTitle subTitle_width20">Mined Time</td>
                            <td>{date.toString()}</td>
                        </tr>
                        <tr>
                            <td className="tdSubTitle subTitle_width20">Num of Txs</td>
                            <td>{this.state.length}</td>
                        </tr>
                        <tr>
                            <td className="tdSubTitle subTitle_width20">Tx Volume</td>
                            <td>{this.state.volume}</td>
                        </tr>
                        <tr>
                            <td className="tdSubTitle subTitle_width20">Tx Transfer</td>
                            <td>{this.state.amount}</td>
                        </tr>
                        <tr>
                            <td className="tdSubTitle subTitle_width20">Tx Fees</td>
                            <td>{this.state.fees}</td>
                        </tr>
                    </tbody>
                </table>
                {this.state.txs.map((tx: ITxProp) => {
                    return (
                        <div key={txIndex++}>
                            <TxLine tx={tx} rest={this.state.rest} />
                            <button className="mdl-button mdl-js-button mdl-button--raised mdl-button--colored txAmtBtn green">
                                {tx.estimated + " HYCON"}
                            </button>
                        </div>
                    )
                })}
                {this.state.hasMore && this.state.txs.length > 0 ?
                    (<div><button className="btn btn-block btn-info" style={{width: "100%", cursor: "pointer"}} onClick={() => this.fetchNextTxs()}>Load more</button></div>)
                    : null}
            </div>
        )
    }

    private fetchNextTxs() {
        this.state.rest.setLoading(true)
        this.state.rest.getNextTxsInBlock(this.state.hash, this.state.txs[0].hash, this.state.index).then((result: ITxProp[]) => {
            this.state.rest.setLoading(false)
            if (result.length === 0) { this.setState({ hasMore: false }) }
            this.setState({
                index: this.state.index + 1,
                txs: update(this.state.txs, { $push: result }),
            })
        })
    }

    private fetchBlock(hash: string) {
        this.state.rest.setLoading(true)
        this.state.rest.getBlock(hash).then((data: IBlock & IResponseError) => {
            this.state.rest.setLoading(false)
            if (data.txs) {
                this.setState({
                    amount: data.amount,
                    block: data,
                    fees: data.fee,
                    length: data.length,
                    txs: data.txs,
                    volume: data.volume,
                })
            } else {
                this.setState({ notFound: true })
            }
        }).catch((e: Error) => {
            alert(e)
        })
    }
}
