import { List } from "material-ui/List"
import * as React from "react"
import update = require("react-addons-update")
import * as ReactPaginate from "react-paginate"
import { IText } from "./locales/locales"
import { IHyconWallet, IRest } from "./rest"
import { WalletSummary } from "./walletSummary"
interface IWalletListView {
    rest: IRest
    wallets: IHyconWallet[]

    language: IText
}
export class WalletList extends React.Component<any, any> {
    public mounted: boolean = false
    constructor(props: any) {
        super(props)
        this.state = { wallets: [], rest: props.rest, index: 0 }
    }
    public componentWillUnmount() {
        this.mounted = false
    }
    public componentDidMount() {
        this.mounted = true
        this.getWalletList(this.state.index)
    }
    public render() {
        let idx = 0
        if (this.state.length === 0) {
            return null
        } else if (this.state.length > 20) {
            return (
                <div>
                    <div className="contentTitle noMarginTitle">
                        {this.props.language["wallet-list"]}
                        <span className="seeMoreLink">
                            <ReactPaginate previousLabel={`${this.props.language["button-previous"]}`}
                                nextLabel={`${this.props.language["button-next"]}`}
                                breakLabel={<a>...</a>}
                                breakClassName={"break-me"}
                                pageCount={(this.state.length / 20)}
                                marginPagesDisplayed={1}
                                pageRangeDisplayed={9}
                                onPageChange={this.handlePageClick}
                                containerClassName={"pagination"}
                                activeClassName={"active"}
                                initialPage={this.state.index}
                                disableInitialCallback={true}
                            />
                        </span>
                    </div>
                    <List style={{ paddingTop: "50px" }}>
                        {this.state.wallets.map((wallet: IHyconWallet) => {
                            return (
                                <WalletSummary
                                    key={idx++}
                                    wallet={wallet}
                                    res={this.state.rest}
                                />
                            )
                        })}
                    </List>
                </div>
            )
        }
        return (
            <div>
                <div className="contentTitle noMarginTitle">
                    { this.props.language["wallet-list"] }
                    </div>
                <List>
                    {this.state.wallets.map((wallet: IHyconWallet) => {
                        return (
                            <WalletSummary
                                key={idx++}
                                wallet={wallet}
                                res={this.state.rest}
                            />
                        )
                    })}
                </List>
            </div>
        )
    }

    private getWalletList(idx: number) {
        this.state.rest.setLoading(true)
        this.state.rest.getWalletList(idx).then((data: { walletList: IHyconWallet[], length: number }) => {
            if (this.mounted) {
                this.setState({
                    wallets: update(
                        this.state.wallets, {
                            $splice: [[0, this.state.wallets.length]],
                        },
                    ),
                })

                this.setState({
                    index: idx,
                    length: data.length,
                    wallets: data.walletList,
                },
                )
            }
            this.state.rest.setLoading(false)
        })
    }

    private handlePageClick = (data: any) => {
        this.getWalletList(data.selected)
    }
}
