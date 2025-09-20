import { useParams } from "react-router-dom";
import OrderDetailsView from "./OrderDetailsView";

const OrderDetailsPage = () => {
    const { id } = useParams();

    console.log(id);
    return(
        <div style={{"color": "black"}}>
            <OrderDetailsView transactionId={id}/>

        </div>
    );
}

export default OrderDetailsPage;