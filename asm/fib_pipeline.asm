.text
	addi $a0, $zero, 3
	jal FIB
	
	add $a0, $zero, $v0
	addi $v0, $zero, 1
	
	addi $v0, $zero, 10
	
FIB:

	addi $sp, $sp, -12
sll $zero, $zero, 0
sll $zero, $zero, 0
	sw $a0, +0($sp)
	sw $ra, +4($sp)
	
	addi $t1, $zero, 1
sll $zero, $zero, 0
	beq $a0, $zero, ZER 
	beq $a0, $t1, ONE

	addi $a0, $a0, -1
	jal FIB
	sw $v0, +8($sp)
	
	lw $a0, +0($sp)
sll $zero, $zero, 0
sll $zero, $zero, 0
	addi $a0, $a0, -2
	jal FIB
	lw $t0, +8($sp)
sll $zero, $zero, 0
sll $zero, $zero, 0
	add $v0, $t0, $v0
RETURN:
	lw $ra, +4($sp)
sll $zero, $zero, 0
	addi $sp, $sp, +12
	jr $ra
	
ZER:
	add $v0, $zero, $zero
	j RETURN
ONE:
	addi $v0, $zero, 1
	j RETURN
