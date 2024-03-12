"use client";
import { useState, useEffect } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { useAction } from "@/hooks/use-action";
import { updateListOrder } from "@/actions/update-list-order";
import { ListWithCards } from "@/types";
import { ListForm } from "./list-form";
import { ListItem } from "./list-item";
import { toast } from "sonner";

interface ListContainerProps {
    data: ListWithCards[];
    boardId: string;
}

function reorder<T>(list: T[], startIndex: number, endIndex: number) {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
}

export const ListContainer = ({ data, boardId }: ListContainerProps) => {
    const [orderedData, setOrderedData] = useState(data);

    const { execute: executeListOrder } = useAction(updateListOrder, {
        onSuccess: () => {
            toast.success("List reodered");
        },
        onError: (error) => {
            toast.error(error);
        },
    });

    useEffect(() => {
        setOrderedData(data);
    }, [data]);

    const onDragEnd = (result: any) => {
        const { destination, source, type } = result;

        if (!destination) return;

        // if dropped in the same position

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        )
            return;

        // list drag&drop

        if (type === "list") {
            const items = reorder(
                orderedData,
                source.index,
                destination.index
            ).map((item, index) => ({ ...item, order: index }));

            setOrderedData(items);
            executeListOrder({ items, boardId });
        }

        // card drag&drop

        if (type === "card") {
            let newOrderedData = [...orderedData];

            const sourceList = newOrderedData.find(
                (list) => list.id === source.droppableId
            );
            const destinationList = newOrderedData.find(
                (list) => list.id === destination.droppableId
            );

            if (!sourceList || !destinationList) return;

            if (!sourceList.cards) {
                sourceList.cards = [];
            }

            if (!destinationList.cards) {
                destinationList.cards = [];
            }

            // same list

            if (source.droppableId === destination.droppableId) {
                const reorderedCards = reorder(
                    sourceList.cards,
                    source.index,
                    destination.index
                );

                reorderedCards.forEach((card, index) => {
                    card.order = index;
                });

                sourceList.cards = reorderedCards;

                setOrderedData(newOrderedData);
            } else {
                // different list
                const [movedCard] = sourceList.cards.splice(source.index, 1);

                movedCard.listId = destination.droppableId;

                destinationList.cards.splice(destination.index, 0, movedCard);

                sourceList.cards.forEach((card, index) => {
                    card.order = index;
                });

                destinationList.cards.forEach((card, index) => {
                    card.order = index;
                });

                setOrderedData(newOrderedData);
            }
        }
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="list" type="list" direction="horizontal">
                {(provided) => (
                    <ol
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="flex gap-x-3 h-full"
                    >
                        {orderedData.map((list, index) => {
                            return (
                                <ListItem
                                    key={list.id}
                                    index={index}
                                    data={list}
                                />
                            );
                        })}
                        {provided.placeholder}
                        <ListForm />
                    </ol>
                )}
            </Droppable>
        </DragDropContext>
    );
};
