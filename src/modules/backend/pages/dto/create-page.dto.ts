import { 
    IsNotEmpty, 
    IsOptional, 
} from "class-validator";

export class CreatePageDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  description?: string;
}
