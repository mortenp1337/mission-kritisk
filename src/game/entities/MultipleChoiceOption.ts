// MultipleChoiceOption entity - represents an answer option for logic puzzles
import { MultipleChoiceOption as IMultipleChoiceOption } from '../types/LogicTypes';

export class MultipleChoiceOption implements IMultipleChoiceOption {
    displayText: string;
    emojiRepresentation: string;
    value: number;
    isCorrect: boolean;
    
    constructor(
        displayText: string,
        emojiRepresentation: string,
        value: number,
        isCorrect: boolean
    ) {
        this.displayText = displayText;
        this.emojiRepresentation = emojiRepresentation;
        this.value = value;
        this.isCorrect = isCorrect;
    }
}
