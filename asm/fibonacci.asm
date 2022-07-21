.text
	addi $v0, $zero, 5
	
	add $a0, $zero, $v0
	jal FIB
	
	add $a0, $zero, $v0
	addi $v0, $zero, 1
	
	addi $v0, $zero, 10
	
FIB:

	addi $sp, $sp, -12
	sw $a0, +0($sp)
	sw $ra, +4($sp)
	
	addi $t1, $zero, 1
	beq $a0, $zero, ZER 
	beq $a0, $t1, ONE

	addi $a0, $a0, -1
	jal FIB
	sw $v0, +8($sp)
	
	lw $a0, +0($sp)
	addi $a0, $a0, -2
	jal FIB
	lw $t0, +8($sp)
	add $v0, $t0, $v0
RETURN:
	lw $ra, +4($sp)
	addi $sp, $sp, +12
	jr $ra
	
ZER:
	add $v0, $zero, $zero
	j RETURN
ONE:
	addi $v0, $zero, 1
	j RETURN
