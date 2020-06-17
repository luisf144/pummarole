<?php

namespace App\Repository;

use App\Entity\Pomodoro;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method Pomodoro|null find($id, $lockMode = null, $lockVersion = null)
 * @method Pomodoro|null findOneBy(array $criteria, array $orderBy = null)
 * @method Pomodoro[]    findAll()
 * @method Pomodoro[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class PomodoroRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Pomodoro::class);
    }

    public function findAllPomodorosByUser($userId)
    {
        $qb = $this->createQueryBuilder('pom');

        if($userId){
            $qb->innerJoin('pom.user', 'user_id')
                ->where('user_id = :userId')
                ->setParameter('userId', $userId);
        }else{
            $qb->where('pom.user IS NULL');
        }

        return $qb->orderBy('pom.id', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
