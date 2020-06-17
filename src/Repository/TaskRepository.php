<?php

namespace App\Repository;

use App\Entity\Task;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method Task|null find($id, $lockMode = null, $lockVersion = null)
 * @method Task|null findOneBy(array $criteria, array $orderBy = null)
 * @method Task[]    findAll()
 * @method Task[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class TaskRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Task::class);
    }

    public function findAllByUser($userId)
    {
        $qb = $this->createQueryBuilder('task');

        if($userId){
            $qb ->innerJoin('task.user', 'user_id')
                ->where('user_id = :userId')
                ->setParameter('userId', $userId);
        }else{
            $qb->where('task.user IS NULL');
        }

        return $qb->orderBy('task.id', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
