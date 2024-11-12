import KitchenStyleGenerator from "./KitchenStyleGenerator";
import KitchenStyleCleaner from "./KitchenStyleCleaner";
import useIsFunkcyjny, {UNAUTHORIZED_PAGE_TEXT} from "../../../services/UseIsFunkcyjny";
import LoadingSpinner from "../../../components/LoadingScreen";
import AlertBox from "../../../components/AlertBox";
import React from "react";


function KitchenStyleGenerateCleanPage() {
    const {isFunkcyjny, isFunkcyjnyLoading, isFunkcyjnyError} = useIsFunkcyjny();

    if (isFunkcyjnyLoading) return <LoadingSpinner/>
    if (isFunkcyjnyError) return <AlertBox text={isFunkcyjnyError} type={"danger"} width={"500px"}/>
    if (!isFunkcyjny) return <AlertBox text={UNAUTHORIZED_PAGE_TEXT} type="danger" width={'500px'} />

    return (
        <div className="fade-in">
            <KitchenStyleGenerator/>
            <KitchenStyleCleaner/>
        </div>
    )
}

export default KitchenStyleGenerateCleanPage;