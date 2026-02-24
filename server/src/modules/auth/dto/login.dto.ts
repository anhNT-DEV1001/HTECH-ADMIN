import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'root',
  })
  @IsNotEmpty({ message: 'Vui lòng nhập tên đăng nhập !' })
  username: string;

  @ApiProperty({
    example: '1234567',
  })
  @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu !' })
  password: string;
}
