import KitchenStyleGenerator from "./KitchenStyleGenerator";
import KitchenStyleCleaner from "./KitchenStyleCleaner";


function KitchenStyleGenerateCleanPage() {


    return (
        <div className="fade-in">
            <KitchenStyleGenerator/>
            <KitchenStyleCleaner/>
        </div>
    )
}

export default KitchenStyleGenerateCleanPage;