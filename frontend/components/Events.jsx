import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
  
const Events = ({ events }) => {
    console.log(events);
    return (
        <>
            <h2 className="text-4xl font-extrabold mt-4">Events</h2>
            <Table className="mt-4">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[200px]">Type</TableHead>
                        <TableHead>Address</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {events.map((event) => (
                    <TableRow key={crypto.randomUUID()}>
                        <TableCell className="font-medium">
                            <Badge className="bg-lime-400">{event.type}</Badge>
                        </TableCell>
                        <TableCell>{event.address}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    )
}
  
export default Events;