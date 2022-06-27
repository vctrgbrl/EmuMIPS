# Sobre a Implementação
Todas intruções da arquitetura MIPS são dividas em 3 tipos:

| Tipo | Opcode | rs | rt | rd | shamt | funct |
| - | ------ 	| -- | -- | -- | ----- | ----- |
| R | 6      	| 5  |  5 | 5  | 5     | 6     |
| I |   6    	|  5 |  5 |     16            |
| J | 6 | 26 	|

## Instruções Implementadas nesse Projeto
| Instrução | Tipo | Significado | Opcode | Função |
| --------- | ---- | ----------- | ------ | ------ |
| ADD		| R | R[rd] = R[rs] + R[rt] | 0 | 20 |
| SUB		| R | R[rd] = R[rs] - R[rt] | 0 | 22 |
| AND		| R | R[rd] = R[rs] & R[rt] | 0 | 24 |
| OR		| R | R[rd] = R[rs] \| R[rt] | 0 | 25 |
| SLL		| R | R[rd] = R[rt] << shamt | 0 | 0 |
| SRL		| R | R[rd] = R[rt] >> shamt | 0 | 2 |
| JR		| R | PC = R[rs] | 0 | 8 |
| ADDI		| I | R[rt] = R[rs] + Imm | 8 |  |
| BEQ		| I | PC += R[rt] == R[rs]?Imm<<2:4 | 4 |  |
| BNE		| I | PC += R[rt] != R[rs]?Imm<<2:4 | 5 |  |
| LW		| I | R[rt] = M[R[rs] + Imm] | 23 |  |
| SW		| I | M[R[rs] + Imm] = R[rt] | 2B |  |
| J			| J | PC += Addr << 2 | 2 |  |
| JAL		| J | PC += Addr << 2 | 3 |  |